// Code of ShenZhou
#include <weapon.h>
// kane, 2/9/98

#include <ansi.h>
inherit STAFF;

void create()
{
        set_name(HIW"灵蛇杖"NOR, ({ "lingshe zhang", "staff", "shezhang", "zhang"}));
        set_weight(4000);  //***** ADDED BY SCATTER *****                 set("wposition", "/d/baituo/obj/lingshezhang.c");
//***** END OF ADDING ***** 
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "一根弯弯曲曲的黑色粗杖，似是钢铁所制，\n"+
		"杖头铸着个裂口而笑的人头，人头口中露出尖利雪白的牙齿，\n"+
		"模样甚是狰狞诡异，更奇的是杖上盘着两条银鳞闪闪的小蛇，不住的蜿蜒上下。\n");
                set("value", 1);
                set("material", "steel");
                set("snake_type","灵蛇");
                set("wield_msg", "$N抽出一根$n握在手中，杖端的银蛇呲呲做响。\n");
                set("unwield_msg", "$N将手中的$n放了下来。\n");
		            set("poison_applied", 50);
        }
        init_staff(180);
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
	if (!present("lingshe zhang", me)) 
		return notify_fail("你身上没有灵蛇杖。\n");

        if (me->query_skill("training",1) < 70+random(70)) {
        message_vision("$N手握灵蛇杖手舞足蹈，好像发疯一般。\n"
                ,me);
		me->receive_damage("jing", 95);
                return 1;
        }
        message_vision("$N手握灵蛇杖手舞足蹈，猛地往地上一摔，将蛇杖化为一条灵蛇。\n",
                me,);
        ob = new("/d/baituo/npc/lingshe");
        ob->move(environment(me));
        destruct(this_object());
        return 1;
}

