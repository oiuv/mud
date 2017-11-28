#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIW "冰魄银针" NOR, ({ "bingpo zhen", "bingpo", "zhen" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一根细长的银针，针尖透出阵阵寒气。\n" NOR);
                set("unit", "些");
                set("base_unit", "根");
                set("base_weight", 500);
                set("base_value", 0);
                set("material", "iron");
        }

        set_temp("daub/poison", ([
                "id"     : "xiao longnv",
                "remain" : 1200,
                "level"  : 100,
                "name"   : "寒冰毒",
        ]));
        set_temp("daub/poison_type", "hanbingdu");
        set_temp("daub/who_name", "李莫愁");
        set_temp("daub/who_id", "li mochou");

        set_amount(50);
        init_throwing(80);
        setup();
}
