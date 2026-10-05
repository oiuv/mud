inherit ITEM;

void create() {
    set_name("菜筐子", ({ "cai kuang" }));
    set_weight(500);
    set_max_encumbrance(8000);
    if (clonep()) {
        object a, b;
        seteuid(getuid());
        if (a = new("/d/items/food/baicai2"))
            a->move(this_object());
        seteuid(getuid());
        if (b = new("/d/items/food/qingcai"))
            b->move(this_object());
        set_default_object(__FILE__);
    } else {
        set("unit", "只");
        set("long", "一只翠绿细竹子竹筐。\n");
        set("value", 500);
    }
}

int is_container() { return 1; }
