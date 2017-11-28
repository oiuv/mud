#include <room.h>
#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", "万安寺寺门");
    set("long", @LONG
这里便是万安寺的大门所在，那万安寺楼高四层，寺后的一座十三级宝
塔更老远便可望见。大门内外不时有亲兵在来回巡视察看，戒备很是森严。
LONG );

    set("exits", ([
        "enter" : __DIR__"was_dayuan",
        "south" : __DIR__"road3",
    ]));

    set("objects", ([
        __DIR__"npc/bing1" : 4,
        __DIR__"npc/bing2" : 1,
    ]));

    set("no_clean_up", 0);
    setup();
}

int valid_leave(object me,string dir)
{
        object ob;

        if ( dir == "enter" && ob = present("qianfu zhang"))
        {
                ob->ccommand("tnnd"+me->query("id"));
                message_vision(CYN "$N喝道：乱党贼子，敢在这里撒野？去死吧！\n" NOR,ob,me);
                ob->kill_ob(me);
                ob=present("guan bing 1");
                if (objectp(ob)) ob->kill_ob(me);
                ob=present("guan bing 2");
                if (objectp(ob)) ob->kill_ob(me);
                ob=present("guan bing 3");
                if (objectp(ob)) ob->kill_ob(me);
                ob=present("guan bing 4");
                if (objectp(ob)) ob->kill_ob(me);
                return notify_fail("大门被蒙古兵挡住了。\n");
        }
        return 1;
}
void init()
{
        object sword, me;
        me = this_player();
        if ((objectp(sword = present("yitian sword", me))))
        {
                remove_call_out("yixiao_rob");
                call_out("yixiao_rob", 1, me, sword);
        }
}

void yixiao_rob(object me, object sword)
{
        message_vision(HIC "\n只听一声诡异的长笑，一条青影向$N" HIC
                       "直扑而来，你定睛一看，原来是明教四大护"
                       "教法王之一的「" NOR+HIB 
                       "青\n翼蝠王" NOR+HIC
                       "」韦一笑。\n\n" NOR,  me);

        if ((int)me->query_skill("parry") < 400)
        {
                message_vision(HIW "$N" HIW "只见对方来势汹涌，连忙抽身抵挡，"
                           "顿时只觉手中一轻，倚天剑已被韦一笑"
                           "夺了过去！\n\n" NOR, me);
                sword->move(environment(me));
                destruct(sword);
                shout(HIR "\n【倚天屠龙】" NOR+WHT "韦一笑：嘿嘿，多谢你将倚天剑取回，咱们后会有期。\n" NOR );
        }
        else {
                message_vision(HIW "$N" HIW "见对方来势汹涌，当即纵身跃起，半"
                           "空中拔出倚天剑，划出一道美丽的寒芒直贯韦一"
                           "笑，只听韦\n一笑一声惨嚎，" NOR+HIR 
                           "鲜血" NOR+HIW 
                           "飞溅。\n\n", me);
        }
        write(HIC "韦一笑长啸一声，施展绝世轻功，飞身飘然而起，扬起一路尘"
              "埃，已不见了踪影......\n" NOR);
}

