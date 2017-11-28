// Room: /d/huashan/sgyhole.c

inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "山洞");
        set("long", @LONG
这是一个毫不起眼的山洞，但是里面的石壁上却画满了五
岳剑派所有已经失传的精妙绝招。花岗岩石壁(wall)上很多小
人，全是用利器刻制，想见当初运力之人内力十分深厚。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "southup"   : __DIR__"sgyhole",
            "northdown" : __DIR__"sgyhole3"
        ]));
        set("item_desc", ([ 
            "wall" : @TEXT

       o    | o      o    \ o      o      o     <o     <o>
    --^|\    ^|^  --v|^    v|v    |/v   \|X|    \|      |
       /\     >\    /<      >\    /<      >\    /<      >\

       o>     o      o      o      o      o      o      o
       \ __   x     </     <|>    </>    <\>    <)>     |\__
      /<      >\    /<      >\    /<      >\     >>     L
TEXT
        ]));

        setup();
}
void init()
{
        add_action("do_mianbi", "mianbi");
        add_action("do_think", "think");
}

int do_think(string msg)
{
    object me = this_player();

    string where, witch;
    
    if (! msg)return notify_fail("什么？\n");

    if (sscanf(msg, "%s from %s", witch, where) != 2)
          return notify_fail("干什么？\n");

    if (witch != "万剑焚云")
          return notify_fail("你想参悟什么？\n");

    if (where != "wall")
          return notify_fail("这里没什么给你参悟的啊！\n");

    if (me->is_busy())
          return notify_fail("你现在正忙着呢。\n");

    if (me->is_fighting())
          return notify_fail("你在战斗哦？！小心，来了！！！\n");
   
    if (me->query("can_perform/zhurong-jian/wan"))
          return notify_fail("你不是已经会了吗？\n");

    if ((int)me->query_skill("zhurong-jian", 1) < 140)
          return notify_fail("你祝融剑法不够娴熟，无法贯通石壁上的绝学！\n");

    if ((int)me->query_skill("force") < 220)
          return notify_fail("你内功修为不够，无法贯通石壁上的绝学！\n");

    if ((int)me->query("max_neili") < 1200)
          return notify_fail("你的内力修为不足，无法贯通石壁上的绝学！\n");

    if ((int)me->query("jing") < 100)
          return notify_fail("你的精力无法集中，无法领悟石壁上的绝学！\n");

    me->start_busy(4 + random(4));

    if (random(10) != 1)   
          return notify_fail("你仔细参悟石壁上的绝学，若有所悟，但是始终无法融会贯通！\n");

    me->receive_damage("jing", 95);

    me->start_busy(2 + random(4));

    write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
    write(HIC "你终于通晓了绝学「万剑焚云」。\n" NOR);

    me->set("can_perform/zhurong-jian/wan", 1);

    if (me->can_improve_skill("sword"))
            me->improve_skill("sword", 1500000);
    if (me->can_improve_skill("zhurong-jian"))
            me->improve_skill("zhurong-jian", 1500000);
    if (me->can_improve_skill("martial-cognize"))
            me->improve_skill("martial-cognize", 1500000);

    return 1;    
}

int do_mianbi()
{
        object ob;
        int c_skill;

        ob = this_player();

        c_skill = (int)ob->query_skill("zhurong-jian", 1);
        if (ob->query_skill("sword", 1) <= c_skill)
        {
                write("你对剑法的了解显然太低，无法领悟石壁内容。\n", ob);
                return 1; 
        }

        if (! ob->can_improve_skill("zhurong-jian"))
        {
                write("$N的实战经验不足，无法领悟石壁内容。\n");
                return 1; 
        }

        if (ob->query("jing") < 40)
        {
                write("你精力不能集中，现在无法领悟石壁内容。\n");
                return 1; 
        }

        if (c_skill >= 10)
        {
                write("你觉得石壁内容太肤浅了。\n");
                return 1;
        }

        message_vision("$N面对着石壁趺坐静思，良久，对「祝融剑法」"
                        "似有所悟。\n", ob);
        ob->improve_skill("zhurong-jian", 1 + random(ob->query("int")));
        ob->receive_damage("jing", 35);
        ob->start_busy(2);
        return 1;
}
