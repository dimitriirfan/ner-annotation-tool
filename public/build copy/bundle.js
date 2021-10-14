
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/SidebarSentence.svelte generated by Svelte v3.43.2 */
    const file$2 = "src/components/SidebarSentence.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (15:8) {#each sentenceIdArray as i, _ }
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1_value = /*i*/ ctx[5] + "";
    	let t1;
    	let t2;
    	let div1;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*i*/ ctx[5]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[4](/*i*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Sentence ");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "x";
    			t4 = space();
    			add_location(div0, file$2, 16, 16, 548);
    			attr_dev(div1, "class", "cursor-pointer w-5 h-5 grid place-content-center text-white group-hover:bg-red-600 rounded");
    			add_location(div1, file$2, 19, 16, 629);
    			attr_dev(div2, "class", "cursor-pointer group flex justify-between py-1 px-3 items-center group-hover:bg-gray-100");
    			add_location(div2, file$2, 15, 12, 384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div2, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", stop_propagation(click_handler), false, false, true),
    					listen_dev(div2, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*sentenceIdArray*/ 2 && t1_value !== (t1_value = /*i*/ ctx[5] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:8) {#each sentenceIdArray as i, _ }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let each_value = /*sentenceIdArray*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Senteces";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "mb-7 text-gray-900 font-bold text-2xl");
    			add_location(h1, file$2, 12, 4, 254);
    			add_location(div0, file$2, 13, 4, 323);
    			attr_dev(div1, "class", "sideba hidden md:flex w-48 flex-col ");
    			add_location(div1, file$2, 11, 0, 198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedSentenceId, sentenceIdArray, dispatch*/ 7) {
    				each_value = /*sentenceIdArray*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SidebarSentence', slots, []);
    	let { sentenceIdArray } = $$props;
    	let { selectedSentenceId } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['sentenceIdArray', 'selectedSentenceId'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SidebarSentence> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => dispatch('delete', { id: i });

    	const click_handler_1 = i => {
    		$$invalidate(0, selectedSentenceId = i);
    	};

    	$$self.$$set = $$props => {
    		if ('sentenceIdArray' in $$props) $$invalidate(1, sentenceIdArray = $$props.sentenceIdArray);
    		if ('selectedSentenceId' in $$props) $$invalidate(0, selectedSentenceId = $$props.selectedSentenceId);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		sentenceIdArray,
    		selectedSentenceId,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('sentenceIdArray' in $$props) $$invalidate(1, sentenceIdArray = $$props.sentenceIdArray);
    		if ('selectedSentenceId' in $$props) $$invalidate(0, selectedSentenceId = $$props.selectedSentenceId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedSentenceId, sentenceIdArray, dispatch, click_handler, click_handler_1];
    }

    class SidebarSentence extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			sentenceIdArray: 1,
    			selectedSentenceId: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SidebarSentence",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*sentenceIdArray*/ ctx[1] === undefined && !('sentenceIdArray' in props)) {
    			console.warn("<SidebarSentence> was created without expected prop 'sentenceIdArray'");
    		}

    		if (/*selectedSentenceId*/ ctx[0] === undefined && !('selectedSentenceId' in props)) {
    			console.warn("<SidebarSentence> was created without expected prop 'selectedSentenceId'");
    		}
    	}

    	get sentenceIdArray() {
    		throw new Error("<SidebarSentence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sentenceIdArray(value) {
    		throw new Error("<SidebarSentence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedSentenceId() {
    		throw new Error("<SidebarSentence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedSentenceId(value) {
    		throw new Error("<SidebarSentence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Annotator.svelte generated by Svelte v3.43.2 */

    const { Object: Object_1, console: console_1, window: window_1 } = globals;
    const file$1 = "src/Annotator.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i][0];
    	child_ctx[35] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i][0];
    	child_ctx[35] = list[i][1];
    	return child_ctx;
    }

    // (145:16) {#each Object.entries(entities) as [_, entity]}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*entity*/ ctx[35].class + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "word-text px-1 py-2 mx-3 svelte-1iuickb");
    			set_style(span, "color", /*entity*/ ctx[35].color);
    			add_location(span, file$1, 145, 20, 4927);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*entities*/ 32 && t_value !== (t_value = /*entity*/ ctx[35].class + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*entities*/ 32) {
    				set_style(span, "color", /*entity*/ ctx[35].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(145:16) {#each Object.entries(entities) as [_, entity]}",
    		ctx
    	});

    	return block;
    }

    // (152:8) {#if ready}
    function create_if_block_1(ctx) {
    	let p;
    	let each_value = /*selectedWordArray*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "sentence leading-10 svelte-1iuickb");
    			add_location(p, file$1, 152, 12, 5251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*entities, selectedWordArray, handleShowEntity, handleSelectEntity, selectedWordIndex, showEntityDropdown, handleDeleteEntity, handleEntityClick*/ 109168) {
    				each_value = /*selectedWordArray*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(152:8) {#if ready}",
    		ctx
    	});

    	return block;
    }

    // (157:20) {#if word.class !== "UNSET"}
    function create_if_block_3(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*word*/ ctx[31].class + "";
    	let t1;
    	let t2;
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[26](/*i*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("| ");
    			t1 = text(t1_value);
    			t2 = space();
    			div = element("div");
    			div.textContent = "x";
    			attr_dev(span, "class", "text-xs font-normal");
    			add_location(span, file$1, 157, 24, 5705);
    			attr_dev(div, "class", "annotation-close svelte-1iuickb");
    			add_location(div, file$1, 160, 24, 5842);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", stop_propagation(click_handler_1), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedWordArray*/ 512 && t1_value !== (t1_value = /*word*/ ctx[31].class + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(157:20) {#if word.class !== \\\"UNSET\\\"}",
    		ctx
    	});

    	return block;
    }

    // (165:20) {#if selectedWordIndex == i && showEntityDropdown}
    function create_if_block_2(ctx) {
    	let div;
    	let each_value_1 = Object.entries(/*entities*/ ctx[5]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "annotation-entity-dropdown rounded border-2 bg-white z-10 svelte-1iuickb");
    			add_location(div, file$1, 165, 24, 6115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*handleSelectEntity, entities*/ 65568) {
    				each_value_1 = Object.entries(/*entities*/ ctx[5]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(165:20) {#if selectedWordIndex == i && showEntityDropdown}",
    		ctx
    	});

    	return block;
    }

    // (167:28) {#each Object.entries(entities) as [_, entity]}
    function create_each_block_1(ctx) {
    	let div;
    	let t_value = /*entity*/ ctx[35].class + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[27](/*i*/ ctx[33], /*entity*/ ctx[35]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "text-gray-900 px-1 font-normal hover:bg-gray-100 bg-white");
    			add_location(div, file$1, 167, 32, 6298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*entities*/ 32 && t_value !== (t_value = /*entity*/ ctx[35].class + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(167:28) {#each Object.entries(entities) as [_, entity]}",
    		ctx
    	});

    	return block;
    }

    // (154:16) {#each selectedWordArray as word, i}
    function create_each_block(ctx) {
    	let span1;
    	let span0;
    	let t0_value = /*word*/ ctx[31].word + " " + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[25](/*i*/ ctx[33]);
    	}

    	let if_block0 = /*word*/ ctx[31].class !== "UNSET" && create_if_block_3(ctx);
    	let if_block1 = /*selectedWordIndex*/ ctx[6] == /*i*/ ctx[33] && /*showEntityDropdown*/ ctx[4] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			add_location(span0, file$1, 155, 20, 5561);
    			attr_dev(span1, "class", "word-text rounded mx-3 px-1 py-2 svelte-1iuickb");
    			set_style(span1, "background-color", /*entities*/ ctx[5][/*word*/ ctx[31].class].color);
    			toggle_class(span1, "entity", /*word*/ ctx[31].class !== "UNSET");
    			add_location(span1, file$1, 154, 16, 5354);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span0, t0);
    			append_dev(span1, t1);
    			if (if_block0) if_block0.m(span1, null);
    			append_dev(span1, t2);
    			if (if_block1) if_block1.m(span1, null);
    			append_dev(span1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", click_handler, false, false, false),
    					listen_dev(span1, "click", stop_propagation(/*handleShowEntity*/ ctx[15]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedWordArray*/ 512 && t0_value !== (t0_value = /*word*/ ctx[31].word + " " + "")) set_data_dev(t0, t0_value);

    			if (/*word*/ ctx[31].class !== "UNSET") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(span1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selectedWordIndex*/ ctx[6] == /*i*/ ctx[33] && /*showEntityDropdown*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(span1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*entities, selectedWordArray*/ 544) {
    				set_style(span1, "background-color", /*entities*/ ctx[5][/*word*/ ctx[31].class].color);
    			}

    			if (dirty[0] & /*selectedWordArray*/ 512) {
    				toggle_class(span1, "entity", /*word*/ ctx[31].class !== "UNSET");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(154:16) {#each selectedWordArray as word, i}",
    		ctx
    	});

    	return block;
    }

    // (185:16) {:else}
    function create_else_block(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "p-2 h-10");
    			input.disabled = true;
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 185, 20, 7038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(185:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (183:16) {#if selectedWordArray[selectedWordIndex]}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "p-2 h-10");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 183, 20, 6900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*selectedWordArray*/ ctx[9][/*selectedWordIndex*/ ctx[6]].word);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[28]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedWordArray, selectedWordIndex*/ 576 && input.value !== /*selectedWordArray*/ ctx[9][/*selectedWordIndex*/ ctx[6]].word) {
    				set_input_value(input, /*selectedWordArray*/ ctx[9][/*selectedWordIndex*/ ctx[6]].word);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(183:16) {#if selectedWordArray[selectedWordIndex]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h10;
    	let t2;
    	let div14;
    	let sidebarsentence;
    	let updating_selectedSentenceId;
    	let t3;
    	let div13;
    	let h11;
    	let t5;
    	let h20;
    	let t7;
    	let div3;
    	let textarea;
    	let t8;
    	let button0;
    	let t10;
    	let br;
    	let t11;
    	let h21;
    	let t13;
    	let div7;
    	let div4;
    	let label0;
    	let t15;
    	let input0;
    	let t16;
    	let div5;
    	let label1;
    	let t18;
    	let input1;
    	let t19;
    	let div6;
    	let label2;
    	let t20;
    	let button1;
    	let t22;
    	let div8;
    	let p;
    	let t23;
    	let h22;
    	let t25;
    	let div9;
    	let t26;
    	let div12;
    	let div10;
    	let label3;
    	let t28;
    	let t29;
    	let div11;
    	let button2;
    	let t31;
    	let button3;
    	let svg;
    	let path;
    	let t32;
    	let span;
    	let current;
    	let mounted;
    	let dispose;

    	function sidebarsentence_selectedSentenceId_binding(value) {
    		/*sidebarsentence_selectedSentenceId_binding*/ ctx[20](value);
    	}

    	let sidebarsentence_props = {
    		sentenceIdArray: /*sentenceIdArray*/ ctx[8]
    	};

    	if (/*selectedSentenceId*/ ctx[1] !== void 0) {
    		sidebarsentence_props.selectedSentenceId = /*selectedSentenceId*/ ctx[1];
    	}

    	sidebarsentence = new SidebarSentence({
    			props: sidebarsentence_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(sidebarsentence, 'selectedSentenceId', sidebarsentence_selectedSentenceId_binding));
    	sidebarsentence.$on("delete", /*delete_handler*/ ctx[21]);
    	let each_value_2 = Object.entries(/*entities*/ ctx[5]);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block0 = /*ready*/ ctx[2] && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*selectedWordArray*/ ctx[9][/*selectedWordIndex*/ ctx[6]]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Word By Word Annotation";
    			t2 = space();
    			div14 = element("div");
    			create_component(sidebarsentence.$$.fragment);
    			t3 = space();
    			div13 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Annotator";
    			t5 = space();
    			h20 = element("h2");
    			h20.textContent = "Input Sentence";
    			t7 = space();
    			div3 = element("div");
    			textarea = element("textarea");
    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "Start Annotation";
    			t10 = space();
    			br = element("br");
    			t11 = space();
    			h21 = element("h2");
    			h21.textContent = "Entities";
    			t13 = space();
    			div7 = element("div");
    			div4 = element("div");
    			label0 = element("label");
    			label0.textContent = "Add Entity Tag";
    			t15 = space();
    			input0 = element("input");
    			t16 = space();
    			div5 = element("div");
    			label1 = element("label");
    			label1.textContent = "Color";
    			t18 = space();
    			input1 = element("input");
    			t19 = space();
    			div6 = element("div");
    			label2 = element("label");
    			t20 = space();
    			button1 = element("button");
    			button1.textContent = "Add";
    			t22 = space();
    			div8 = element("div");
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t23 = space();
    			h22 = element("h2");
    			h22.textContent = "Annotate Sentence";
    			t25 = space();
    			div9 = element("div");
    			if (if_block0) if_block0.c();
    			t26 = space();
    			div12 = element("div");
    			div10 = element("div");
    			label3 = element("label");
    			label3.textContent = "Update Text";
    			t28 = space();
    			if_block1.c();
    			t29 = space();
    			div11 = element("div");
    			button2 = element("button");
    			button2.textContent = "Reset";
    			t31 = space();
    			button3 = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t32 = space();
    			span = element("span");
    			span.textContent = "Export";
    			if (!src_url_equal(img.src, img_src_value = "../resources/icons/menu.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 106, 8, 3196);
    			add_location(div0, file$1, 105, 4, 3181);
    			attr_dev(h10, "class", "text-2xl font-bold");
    			add_location(h10, file$1, 109, 8, 3301);
    			attr_dev(div1, "class", "container mx-auto");
    			add_location(div1, file$1, 108, 4, 3260);
    			attr_dev(div2, "class", "md:bg-white p-5 mb-3 shadow-sm");
    			add_location(div2, file$1, 104, 0, 3131);
    			attr_dev(h11, "class", "mb-7 text-gray-900 font-bold text-2xl");
    			add_location(h11, file$1, 118, 8, 3584);
    			attr_dev(h20, "class", "text-gray-900 font-bold text-xl mb-3");
    			add_location(h20, file$1, 119, 8, 3658);
    			attr_dev(textarea, "class", "w-full border-2");
    			attr_dev(textarea, "cols", "40");
    			attr_dev(textarea, "rows", "5");
    			add_location(textarea, file$1, 121, 12, 3755);
    			add_location(div3, file$1, 120, 8, 3736);
    			attr_dev(button0, "class", "self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded");
    			add_location(button0, file$1, 123, 8, 3869);
    			add_location(br, file$1, 124, 8, 4032);
    			attr_dev(h21, "class", "text-gray-900 font-bold text-xl mb-3");
    			add_location(h21, file$1, 126, 8, 4056);
    			attr_dev(label0, "for", "");
    			add_location(label0, file$1, 130, 16, 4210);
    			attr_dev(input0, "class", "p-2 h-10");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$1, 131, 16, 4264);
    			add_location(div4, file$1, 129, 12, 4187);
    			attr_dev(label1, "for", "");
    			add_location(label1, file$1, 134, 16, 4385);
    			attr_dev(input1, "class", "p-2 h-10");
    			attr_dev(input1, "type", "color");
    			add_location(input1, file$1, 135, 16, 4430);
    			add_location(div5, file$1, 133, 12, 4362);
    			attr_dev(label2, "for", "");
    			add_location(label2, file$1, 138, 16, 4552);
    			attr_dev(button1, "class", "h-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded");
    			add_location(button1, file$1, 139, 16, 4592);
    			add_location(div6, file$1, 137, 12, 4529);
    			attr_dev(div7, "class", "flex gap-3 mb-3 items-end");
    			add_location(div7, file$1, 128, 8, 4134);
    			attr_dev(p, "class", "sentence svelte-1iuickb");
    			add_location(p, file$1, 143, 12, 4820);
    			attr_dev(div8, "class", "h-16 border-2 mb-3 p-3");
    			add_location(div8, file$1, 142, 8, 4770);
    			attr_dev(h22, "class", "text-gray-900 font-bold text-xl mb-3");
    			add_location(h22, file$1, 149, 8, 5086);
    			attr_dev(div9, "class", "wrapper-annotator border-2 mb-3 p-3 svelte-1iuickb");
    			add_location(div9, file$1, 150, 8, 5167);
    			attr_dev(label3, "for", "");
    			add_location(label3, file$1, 181, 16, 6785);
    			attr_dev(div10, "class", "");
    			add_location(div10, file$1, 180, 12, 6753);
    			attr_dev(button2, "class", "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded");
    			add_location(button2, file$1, 189, 16, 7201);
    			attr_dev(path, "d", "M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z");
    			add_location(path, file$1, 191, 114, 7573);
    			attr_dev(svg, "class", "fill-current w-4 h-4 mr-2");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$1, 191, 20, 7479);
    			add_location(span, file$1, 192, 20, 7654);
    			attr_dev(button3, "class", "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center");
    			add_location(button3, file$1, 190, 16, 7316);
    			attr_dev(div11, "class", "flex gap-3 justify-self-end");
    			add_location(div11, file$1, 188, 12, 7142);
    			attr_dev(div12, "class", "flex justify-between align-middle");
    			add_location(div12, file$1, 179, 8, 6692);
    			attr_dev(div13, "class", "flex-1 flex flex-col");
    			add_location(div13, file$1, 117, 4, 3540);
    			attr_dev(div14, "class", "flex container mx-auto");
    			add_location(div14, file$1, 113, 0, 3384);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h10);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div14, anchor);
    			mount_component(sidebarsentence, div14, null);
    			append_dev(div14, t3);
    			append_dev(div14, div13);
    			append_dev(div13, h11);
    			append_dev(div13, t5);
    			append_dev(div13, h20);
    			append_dev(div13, t7);
    			append_dev(div13, div3);
    			append_dev(div3, textarea);
    			set_input_value(textarea, /*input_text*/ ctx[3]);
    			append_dev(div13, t8);
    			append_dev(div13, button0);
    			append_dev(div13, t10);
    			append_dev(div13, br);
    			append_dev(div13, t11);
    			append_dev(div13, h21);
    			append_dev(div13, t13);
    			append_dev(div13, div7);
    			append_dev(div7, div4);
    			append_dev(div4, label0);
    			append_dev(div4, t15);
    			append_dev(div4, input0);
    			set_input_value(input0, /*newEntityClass*/ ctx[7]);
    			append_dev(div7, t16);
    			append_dev(div7, div5);
    			append_dev(div5, label1);
    			append_dev(div5, t18);
    			append_dev(div5, input1);
    			set_input_value(input1, /*newEntityColor*/ ctx[0]);
    			append_dev(div7, t19);
    			append_dev(div7, div6);
    			append_dev(div6, label2);
    			append_dev(div6, t20);
    			append_dev(div6, button1);
    			append_dev(div13, t22);
    			append_dev(div13, div8);
    			append_dev(div8, p);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}

    			append_dev(div13, t23);
    			append_dev(div13, h22);
    			append_dev(div13, t25);
    			append_dev(div13, div9);
    			if (if_block0) if_block0.m(div9, null);
    			append_dev(div13, t26);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div10, label3);
    			append_dev(div10, t28);
    			if_block1.m(div10, null);
    			append_dev(div12, t29);
    			append_dev(div12, div11);
    			append_dev(div11, button2);
    			append_dev(div11, t31);
    			append_dev(div11, button3);
    			append_dev(button3, svg);
    			append_dev(svg, path);
    			append_dev(button3, t32);
    			append_dev(button3, span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "click", /*handleResetState*/ ctx[17], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[22]),
    					listen_dev(button0, "click", /*handleStartAnnotation*/ ctx[10], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[23]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[24]),
    					listen_dev(button1, "click", /*handleAddNewEntity*/ ctx[12], false, false, false),
    					listen_dev(button3, "click", /*handleExportData*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const sidebarsentence_changes = {};
    			if (dirty[0] & /*sentenceIdArray*/ 256) sidebarsentence_changes.sentenceIdArray = /*sentenceIdArray*/ ctx[8];

    			if (!updating_selectedSentenceId && dirty[0] & /*selectedSentenceId*/ 2) {
    				updating_selectedSentenceId = true;
    				sidebarsentence_changes.selectedSentenceId = /*selectedSentenceId*/ ctx[1];
    				add_flush_callback(() => updating_selectedSentenceId = false);
    			}

    			sidebarsentence.$set(sidebarsentence_changes);

    			if (dirty[0] & /*input_text*/ 8) {
    				set_input_value(textarea, /*input_text*/ ctx[3]);
    			}

    			if (dirty[0] & /*newEntityClass*/ 128 && input0.value !== /*newEntityClass*/ ctx[7]) {
    				set_input_value(input0, /*newEntityClass*/ ctx[7]);
    			}

    			if (dirty[0] & /*newEntityColor*/ 1) {
    				set_input_value(input1, /*newEntityColor*/ ctx[0]);
    			}

    			if (dirty[0] & /*entities*/ 32) {
    				each_value_2 = Object.entries(/*entities*/ ctx[5]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (/*ready*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div9, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div10, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebarsentence.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebarsentence.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div14);
    			destroy_component(sidebarsentence);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Annotator', slots, []);
    	let ready = false;
    	let input_text = "";

    	let data = {
    		classes: ["UNSET"],
    		words: [{ sentenceNum: 0, word: "", class: "UNSET" }]
    	};

    	let showEntityDropdown = false;
    	let entities = { "UNSET": { class: "UNSET", color: "" } };
    	let selectedWordIndex = null;
    	let selectedEntity = { word: "", class: "" };
    	let newEntityClass;
    	let newEntityColor;
    	let sentenceIdArray = [];
    	let currentSentenceId = 0;
    	let selectedSentenceId = 0;
    	let selectedWordArray;

    	const handleStartAnnotation = () => {
    		const word_list = input_text.split(" ");
    		let tempData;

    		if (currentSentenceId !== 0) {
    			tempData = [...data.words];
    		}

    		$$invalidate(19, data = {
    			classes: ["UNSET"],
    			words: word_list.map(word => {
    				return {
    					sentenceNum: currentSentenceId,
    					word,
    					class: "UNSET"
    				};
    			})
    		});

    		if (currentSentenceId !== 0) {
    			$$invalidate(19, data.words = tempData.concat(data.words), data);
    		}

    		$$invalidate(19, data);
    		$$invalidate(2, ready = true);
    		$$invalidate(1, selectedSentenceId = currentSentenceId);
    		sentenceIdArray.push(currentSentenceId);
    		currentSentenceId += 1;
    		$$invalidate(8, sentenceIdArray);
    	};

    	const handleEntityClick = i => {
    		selectedEntity = selectedWordArray[i];
    		$$invalidate(6, selectedWordIndex = i);
    	};

    	const handleAddNewEntity = () => {
    		$$invalidate(
    			5,
    			entities[newEntityClass] = {
    				class: newEntityClass,
    				color: newEntityColor
    			},
    			entities
    		);

    		data.classes.push(newEntityClass);
    		$$invalidate(19, data);
    	};

    	const handleDeleteEntity = i => {
    		$$invalidate(19, data.words[i].class = "UNSET", data);
    		$$invalidate(19, data);
    	};

    	const handleExportData = () => {
    		let json = JSON.stringify(data);
    		json = [json];
    		const blob1 = new Blob(json, { type: "text/plain;charset=utf-8" });
    		const url = window.URL || window.webkitURL;
    		const link = url.createObjectURL(blob1);
    		let a = document.createElement("a");
    		a.download = "Customers.txt";
    		a.href = link;
    		document.body.appendChild(a);
    		a.click();
    		document.body.removeChild(a);
    	};

    	const handleShowEntity = () => {
    		$$invalidate(4, showEntityDropdown = !showEntityDropdown);
    	};

    	const handleSelectEntity = (i, newClass) => {
    		$$invalidate(9, selectedWordArray[i].class = newClass, selectedWordArray);
    		$$invalidate(19, data);
    	};

    	const handleResetState = () => {
    		$$invalidate(4, showEntityDropdown = false);
    	};

    	const handleDeleteSentence = e => {
    		$$invalidate(19, data.words = data.words.filter(item => item.sentenceNum !== e.detail.id), data);
    		$$invalidate(8, sentenceIdArray = sentenceIdArray.filter(item => item !== e.detail.id));
    		$$invalidate(19, data);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Annotator> was created with unknown prop '${key}'`);
    	});

    	function sidebarsentence_selectedSentenceId_binding(value) {
    		selectedSentenceId = value;
    		$$invalidate(1, selectedSentenceId);
    	}

    	const delete_handler = e => handleDeleteSentence(e);

    	function textarea_input_handler() {
    		input_text = this.value;
    		$$invalidate(3, input_text);
    	}

    	function input0_input_handler() {
    		newEntityClass = this.value;
    		$$invalidate(7, newEntityClass);
    	}

    	function input1_input_handler() {
    		newEntityColor = this.value;
    		$$invalidate(0, newEntityColor);
    	}

    	const click_handler = i => handleEntityClick(i);
    	const click_handler_1 = i => handleDeleteEntity(i);
    	const click_handler_2 = (i, entity) => handleSelectEntity(i, entity.class);

    	function input_input_handler() {
    		selectedWordArray[selectedWordIndex].word = this.value;
    		(($$invalidate(9, selectedWordArray), $$invalidate(1, selectedSentenceId)), $$invalidate(19, data));
    		$$invalidate(6, selectedWordIndex);
    	}

    	$$self.$capture_state = () => ({
    		SidebarSentence,
    		ready,
    		input_text,
    		data,
    		showEntityDropdown,
    		entities,
    		selectedWordIndex,
    		selectedEntity,
    		newEntityClass,
    		newEntityColor,
    		sentenceIdArray,
    		currentSentenceId,
    		selectedSentenceId,
    		selectedWordArray,
    		handleStartAnnotation,
    		handleEntityClick,
    		handleAddNewEntity,
    		handleDeleteEntity,
    		handleExportData,
    		handleShowEntity,
    		handleSelectEntity,
    		handleResetState,
    		handleDeleteSentence
    	});

    	$$self.$inject_state = $$props => {
    		if ('ready' in $$props) $$invalidate(2, ready = $$props.ready);
    		if ('input_text' in $$props) $$invalidate(3, input_text = $$props.input_text);
    		if ('data' in $$props) $$invalidate(19, data = $$props.data);
    		if ('showEntityDropdown' in $$props) $$invalidate(4, showEntityDropdown = $$props.showEntityDropdown);
    		if ('entities' in $$props) $$invalidate(5, entities = $$props.entities);
    		if ('selectedWordIndex' in $$props) $$invalidate(6, selectedWordIndex = $$props.selectedWordIndex);
    		if ('selectedEntity' in $$props) selectedEntity = $$props.selectedEntity;
    		if ('newEntityClass' in $$props) $$invalidate(7, newEntityClass = $$props.newEntityClass);
    		if ('newEntityColor' in $$props) $$invalidate(0, newEntityColor = $$props.newEntityColor);
    		if ('sentenceIdArray' in $$props) $$invalidate(8, sentenceIdArray = $$props.sentenceIdArray);
    		if ('currentSentenceId' in $$props) currentSentenceId = $$props.currentSentenceId;
    		if ('selectedSentenceId' in $$props) $$invalidate(1, selectedSentenceId = $$props.selectedSentenceId);
    		if ('selectedWordArray' in $$props) $$invalidate(9, selectedWordArray = $$props.selectedWordArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedSentenceId, data*/ 524290) {
    			($$invalidate(9, selectedWordArray = data.words.filter(item => item.sentenceNum === selectedSentenceId)));
    		}

    		if ($$self.$$.dirty[0] & /*newEntityColor*/ 1) {
    			console.log(newEntityColor);
    		}
    	};

    	return [
    		newEntityColor,
    		selectedSentenceId,
    		ready,
    		input_text,
    		showEntityDropdown,
    		entities,
    		selectedWordIndex,
    		newEntityClass,
    		sentenceIdArray,
    		selectedWordArray,
    		handleStartAnnotation,
    		handleEntityClick,
    		handleAddNewEntity,
    		handleDeleteEntity,
    		handleExportData,
    		handleShowEntity,
    		handleSelectEntity,
    		handleResetState,
    		handleDeleteSentence,
    		data,
    		sidebarsentence_selectedSentenceId_binding,
    		delete_handler,
    		textarea_input_handler,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_input_handler
    	];
    }

    class Annotator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Annotator",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let annotator;
    	let current;
    	annotator = new Annotator({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(annotator.$$.fragment);
    			add_location(main, file, 6, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(annotator, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(annotator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(annotator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(annotator);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ Annotator, name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
