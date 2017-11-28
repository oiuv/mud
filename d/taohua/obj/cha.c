inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("醉仙茶", ({ "zuixian cha","cha" }));
        set_weight(1000);
        if( clonep() )
            set_default_object(__FILE__);
        else {
        set("long",
"这是一杯颜色碧绿、香味浓郁上等好茶。是招待桃花岛来客的。!\n");
                set("unit", "杯");
                set("value", 20);
                set("max_liquid", 10);
        }
        set("liquid", ([
            "name" : "醉仙茶",
            "remaining" : 8,
        	"type" : "water"
        ]) );
        set("liquid_type", "water");
        setup();
}
