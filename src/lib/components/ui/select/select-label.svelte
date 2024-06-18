<script lang="ts">
    import {Select as SelectPrimitive} from "bits-ui";
    import {cn} from "$lib/utils.js";

    type $$Props = SelectPrimitive.LabelProps;

    let className: $$Props["class"] = undefined;
    export {className as class};
</script>

<SelectPrimitive.Label
        {...$$restProps}
        class={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
>
    <slot/>
</SelectPrimitive.Label>
