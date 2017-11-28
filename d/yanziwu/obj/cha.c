// cha.c

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("碧螺春", ({ "biluo chun","cha" }));
        set_weight(1000);
        if (clonep())
            set_default_object(__FILE__);
        else {
        	set("long",
"这是一杯颜色碧绿、香味浓郁上等好茶。本地人称作吓煞人香。!\n");
                set("unit", "杯");
                set("value", 20);
                set("max_liquid", 10);
        }
        set("liquid", ([
            	"name" : "碧螺春",
            	"remaining" : 8,
                "type" : "water"
        ]));
        set("liquid_type", "water");
        setup();
}

