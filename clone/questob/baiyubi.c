// baiyubi.c

inherit ITEM;

void create()
{
    set_name("白玉笔", ({ "baiyu bi", "bi" }));
    set_weight(300);
    if (clonep())
        set_default_object(__FILE__);
    else {
        set("unit", "支");
        set("long", "晶莹剔透的的汉白玉琢磨的笔形饰物。\n");
        set("value", 3000);
        set("material", "stone");
    }
    setup();
}
