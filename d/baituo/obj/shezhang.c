// Code of ShenZhou
#include <weapon.h>
// Jay 10/7/96

inherit STAFF;

void create()
{
        set_name("蛇杖", ({ "shezhang", "staff", "zhang" }));
        set_weight(4000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "一根长约七尺的黑光铮亮的钢杖，杖端有一个蛇头，"
		"有机关可射出毒针伤人。\n");
                set("value", 450);
                set("snake_type","毒蛇");
                set("material", "steel");
                set("wield_msg", "$N抽出一根$n握在手中，杖端的蛇头呲呲做响。\n");
                set("unwield_msg", "$N将手中的$n放了下来。\n");
        }
        init_staff(35);
        setup();
}

void init()
{
        add_action("convert","bian");
}

int convert(string arg)
{
        object me = this_player();
        object ob;

        if (arg!="shezhang" && arg!="staff" && arg!="zhang") return 0;
        if (me->query("family/family_name") != "欧阳世家") 
                return notify_fail("你不能化杖为蛇。\n");
        if ((int)me->query("jing") < 100)
                return notify_fail("你的精力不够。\n");
	if (!present("shezhang", me)) 
		return notify_fail("你身上没有蛇杖。\n");

        if (random(me->query_skill("training",1)) <20) {
        message_vision("$N手握蛇杖手舞足蹈，好像发疯一般。\n"
                ,me);
		me->receive_damage("jing", 95);
                return 1;
        }
        message_vision("$N手握蛇杖手舞足蹈，猛地往地上一摔，将蛇杖化为一条毒蛇。\n",
                me,);
                ob = new("/d/baituo/npc/snake");
        ob->move(environment(me));
        destruct(this_object());
        return 1;
}

