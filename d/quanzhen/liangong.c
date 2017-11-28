#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "练功房");
        set("long", @LONG
这里是全真教弟子练功的房间。这座房间形状甚是奇特前
窄後宽，成为梯形，东边半圆，西边却作三角形状，原来这是
全真教独有的练功室，前窄练掌，後宽使指，东圆研剑，西角
发镖。房中央立着几个练功用的木人，吊着几个沙袋 (bag)和
纸册(paper)。
LONG);

        set("exits", ([
                "south" : __DIR__"houtang2",
                "north" : __DIR__"chanfang2",
        ]));
        set("item_desc", ([
                "paper" : YEL "\n这是一摞厚厚的牛皮纸册，用铁钉钉在墙上。好象"
                          "可以用来练\n掌法的，你可以试着打(da)打看。\n" NOR,

                "bag"   : WHT "\n这是一个大沙袋，看起来非常结实。好象是专门用"
                          "来练习指法\n的，你可以刺(ci)刺它试试看。\n" NOR,
        ]));
        set("for_family", "全真教");
        setup();
}

void init()
{
        add_action("do_strike", "da");
        add_action("do_finger", "ci");
}

int do_finger()
{
        object me;
        int qi_cost, c_skill;

        me = this_player();
        c_skill=me->query_skill("finger", 1);

        message_vision(HIY "$N" HIY "伸指狠狠地点向沙袋，觉得指尖微微"
                       "有些痛。\n" NOR, me);
        qi_cost = 25;

        if (me->query("qi") > qi_cost)
        {
                if (me->can_improve_skill("finger") && c_skill < 100)
		{
                	me->improve_skill("finger", 1 + random(me->query("str")));
		        tell_object(me, HIC "你对「基本指法」有了新的领悟。\n" NOR);
		}
                me->receive_damage("qi", qi_cost);
        }
        return 1;
}

int do_strike()
{
        object me;
        int qi_cost, c_skill;

        me = this_player();
        c_skill = me->query_skill("strike", 1);

        message_vision(HIY "$N" HIY "蹲了一个马步，挥起一掌猛击向牛皮"
                       "纸册。\n" NOR, me);
        qi_cost = 25;

        if (me->query("qi") > qi_cost)
        {
                if (me->can_improve_skill("strike") && c_skill < 100)
		{
	                me->improve_skill("strike", 1 + random(me->query("str")));
		        tell_object(me, HIC "你对「基本掌法」有了新的领悟。\n" NOR);
		}
                me->receive_damage("qi", qi_cost);
        } 
        return 1;
}
