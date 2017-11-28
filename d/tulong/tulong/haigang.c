#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "东海之滨");
        set("long", @LONG
这里就是大海之滨，浪花拍打着礁石，发出阵阵响声，海
面上一群群海鸥欧欧地叫着，不时有鱼儿跃出海面，溅起层层
浪花。边上有艘大船(boat)，船上坐着几个渔夫打扮的人，乘
船可渡过大海到达海的另一端。西面一直走就是燕京了，东面
是一望无际的大海。极目眺望不禁让人心胸开扩神舒意畅，的
确是一个好居处。
LONG);
        set("exits", ([
                "west"  : "/d/beijing/road10",
                "north" : __DIR__"haian",
        ]));

        set("item_desc", ([
                "boat" : "这是一艘大帆船，造得很结实，看来可以出远海的。\n",
        ]));

        set("objects", ([
                "/d/shenlong/npc/chuanfu" :1,
        ]));

        set("outdoors", "beijing");
        setup();
}

void init()
{
        object me, dao, room, bai, ding;

        me = this_player();
        room = load_object("/d/tulong/tulong/huichang");
        ding = present("ding", room);

        if (objectp(ding)) 
        	dao = present("tulong dao", ding);

        if (objectp(dao))
        {
                room = load_object("/d/tulong/tulong/daobian");
                bai = present("bai guishou", room);

                tell_object(me, HIC "\n只见岸边上泊满了海船，所有的海船全部标记着天"
                               "鹰教的标志。\n" NOR);

                if (objectp(bai)
                   && ! bai->query_temp("go")
                   && ! me->query_temp("to_wang")
                   && me->query("combat_exp") > 1000000
                   && me->query("weiwang") > 100000)
		{
              	        tell_object(me, CYN "\n白龟寿对你说道：此次我天鹰教得到了屠"
                                        "龙宝刀，这位武林同\n道可愿意参加扬刀立威大"
                                        "会，选出此刀该为何人所有？\n" NOR);
                        tell_object(me, HIR "\n你愿意参加(" HIY "accept" HIR ")王盘"
                                        "山岛扬刀立威大会吗？\n" NOR);
                	me->set_temp("to_wang", 1);
                	add_action("do_accept", "accept");
		}
        }
}

int do_accept()
{
        object me, room, bai;

        me = this_player();
        room = load_object("/d/tulong/tulong/daobian");
        bai = present("bai guishou", room);

        if (! me->query_temp("to_wang"))
                return notify_fail("什么？\n");

        if (bai->query_temp("go"))
                return notify_fail("真是可惜，已经有人比你早一步参加了。\n");

        tell_object(me, HIR "你决定去参加扬刀立威大会。\n\n" NOR);

       	bai->set_temp("go", 1);
        me->start_busy(15);

        remove_call_out("moveto");
        call_out("moveto", 10, me);
        return 1;
}

int moveto(object me)
{
        message_vision(HIC "\n$N" HIC "坐上了天鹰教的大船，听到舵子"
                       "手喊道：“开船了！”大船\n慢慢的向大海驶进"
                       "。\n\n" NOR, me);
        me->move("/d/tulong/tulong/boat");

        remove_call_out("arrive1");
        call_out("arrive1", 10, me);
        return 1;
}

int arrive1(object me)
{
        message_vision(HIB "\n天鹰教的大船在大海上慢慢的漂着……$N"
                       HIB "不禁感到睡意朦胧。\n" NOR, me);

        remove_call_out("arrive2");
        call_out("arrive2", 10, me);
        return 1;
}

int arrive2(object me)
{
        message_vision(HIY "\n$N" HIY "突然听到一声惊喝：“到了，下"
                       "船吧！”$N" HIY "顿时提起精神跟\n着天鹰教教"
                       "众下了船。\n\n" NOR, me);
        me->move("/d/tulong/tulong/boat2");
        tell_object(me, HIC "\n你跟随天鹰教到达了王盘山岛边。\n\n" NOR);
        return 1;
}
