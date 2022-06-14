inherit ITEM;

int is_container() { return 1; }

void create()
{
    parse_init();
    set_name("保险箱", ({"safe", "safe deposit box", "box"}));
    set_weight(50000);
    set_max_encumbrance(100000);

    set("unit", "个");
    set("long", "一个钛合金制作的保险箱，防火防盗防破坏...");
    set("value", 10000);
    set("no_get", 1);

    restore_object(__FILE__);
}

varargs void remove(string euid)
{
    ::remove();
    save_object(__FILE__);
}
