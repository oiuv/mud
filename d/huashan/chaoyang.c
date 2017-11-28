// chaoyang.c
// updated by Ivy at 2015年4月16日

inherit ROOM;
#include <ansi.h>
 
void create()
{
        set("short", "朝阳峰");
        set("long", @LONG
这里就是华山的东峰，也称朝阳峰，是华山看日出的绝佳处。於此俯
瞰，黄河隐显东迤如带，南望小孤峰背倚山河。小孤峰上有一小亭，覆以
铁瓦，亭中摆有铁棋盘一局，那就是华山著名的“博台”了。远望东壁悬
崖（ya）上，更有一个巨型掌印，相传为「河神巨灵」劈山时所留下的，
李白诗中“巨灵咆哮劈两山，洪波喷流射东海”就是指这个上古传说。
LONG );
        set("exits", ([ /* sizeof() == 1 */
           "westdown" : __DIR__"chaopath2",
        ]));


        set("item_desc", ([
           "ya"   : NOR + WHT "悬崖下峭壁高耸，一条青藤（teng）直垂而下。\n" NOR,
           "teng" : HIG "一根青藤，如果你轻功不错，可以试着拉（la）住它可以跳（jump）下悬崖。\n" NOR,
        ]));

        set("outdoors", "huashan" );

        setup();
}
 
void init()
{
        add_action("do_la", "la");
        add_action("do_jump", "jump");
}

int do_la(string arg)
{
        object me = this_player();

        if (! arg || arg != "teng")
               return notify_fail("你要拉什么？\n");

        if (me->is_busy() || me->is_fighting())
               return notify_fail("等你忙完了再说吧！\n");

        if (me->query_temp("la_teng_huashan"))
               return notify_fail("你已经拉住青藤了。\n");

        message_vision(HIG "$N" HIG "将青藤牢牢地抓住了。\n", me);

        me->set_temp("la_teng_huashan", 1);

        me->start_busy(2);

        return 1;          
}

int do_jump(string arg)
{
        object me = this_player();

        if (! arg || arg != "ya")
               return notify_fail("你要往哪儿跳？\n");

        if (me->is_busy() || me->is_fighting())
               return notify_fail("等你忙完了再说吧！\n");

        if (! me->query_temp("la_teng_huashan") && me->query_dex()<30)
        {

               message_vision(HIM "$N" HIM "纵身跳下悬崖 ……\n", me);
/*
               CHANNEL_D->do_channel(this_object(), "rumor", "听说" + me->name() + HIM "跳"
                                     "下华山悬崖，自杀生亡。\n" NOR); 
*/
               me->move("/d/huashan/xuanya");
               me->set_temp("die_reason", "跳下华山悬崖，自杀身亡");
               me->die(); 
               return 1;   

        }

        message_vision(HIG "$N" HIG "拉着青藤跳下悬崖……\n", me);
                
        tell_object(me, HIG "猛然间，你发现下面有一个小洞，你猛一弯腰，借力跳了进去。\n" NOR);

        me->move("/d/huashan/jinshedong");
        me->delete_temp("la_teng_huashan");
        me->start_busy(2);

        return 1;          
}