// jinshedong.c
// Modify by Ivy for Heros.YD

inherit ROOM;
#include <ansi.h>

#define SWORD "/d/jinshe/obj/jinshe-jian"
#define MIJI "/clone/book/jinshe1"

object ob;
string msg;
string look_sword();

void create()
{
        set("short", HIY "金蛇洞" NOR);
/*
        msg = "只见对面石壁上斜倚着一副骷髅骨，身上衣服已烂了七八成，那骷髅\n"
              "骨宛然尚可见到是个人形。你见到这副情形，一颗心嘣嘣乱跳，见石室中\n"
              "别无其他可怖事物，于走近仔细照看。石壁上有几百幅用利器刻成的简陋\n"
              "人形，每个人形均不相同，举手踢足，似在练武。你挨次看去，密密层层\n"
              "的都是图形，心下不解，不知刻在这里有甚么用意。图形尽处，石壁上出\n"
              "现了几行字，也是以利器所刻，凑过去一看，见刻的是十六个字：“重宝\n"
              "秘术，付与有缘，入我门来，遇祸莫怨。”";
*/
        msg = "这里是华山悬崖上的一个山洞，洞口有一根青藤摇晃着，洞内被修成\n"
              "一个简陋的石室，石室中空无一物，只是在石壁上刻有一些小字，凑过去\n"
              "一看，是十六个字：“重宝秘术  付与有缘  入我门来  遇祸莫怨”。";

        if (! ob = find_object(SWORD))
                 ob = load_object(SWORD);

        if (! environment(ob))
        {
                 destruct(ob);

                 msg += "这\n十六字之旁，有个剑柄凸出在石壁之上，似是一把剑（sword）插入了石\n"
                        "壁，直至剑柄。\n";
        }

        else msg += "\n";

        set("long", msg);
        set("outdoors", "jinshe");
        set("item_desc", ([
              "ya"    : NOR + WHT "悬崖下峭壁高耸，一条青藤（teng）直垂而下。\n" NOR,
              "teng"  : HIG "一根青藤，在半空中摇晃着，可以用他爬（climb）上悬崖。\n" NOR,
              "sword" : (: look_sword :),
        ]));        

        setup();
}

void init()
{
        add_action("do_climb", "climb");
        add_action("do_ba", "ba");
        add_action("do_wa", "wa");
}

int do_wa()
{
        object me = this_player();
        object ob;

        if (! ob = find_object(MIJI))
                ob = load_object(MIJI);

        if (me->is_busy() || me->is_fighting())
                return notify_fail("等你忙完了再说吧！\n");

        message_vision(HIC "$N" HIC "使劲地在地上挖，不一会儿挖出一个洞来。\n" NOR, me);

        if (environment(ob))
        {                
                me->start_busy(2);
                return 1;
        }

        tell_object(me, HIG "你猛然发现下面有一本书，你将它拿了起来。\n" NOR);

        ob->move(me);
        me->start_busy(2);

        return 1;
}

string look_sword()
{
        object ob;
  
        if (! ob = find_object(SWORD))
                ob = load_object(SWORD);

        if (! environment(ob))
        {
              destruct(ob);
              return HIG "一柄形状奇特的剑。\n" NOR;
        }

        return "你要看什么？\n";
}

int do_ba(string arg)
{
        object me = this_player();
        object ob;
        string show;
/*
        show = "只见对面石壁上斜倚着一副骷髅骨，身上衣服已烂了七八成，那骷髅\n"
              "骨宛然尚可见到是个人形。他见到这副情形，一颗心嘣嘣乱跳，见石室中\n"
              "别无其他可怖事物，于走近仔细照看。石壁上有几百幅用利器刻成的简陋\n"
              "人形，每个人形均不相同，举手踢足，似在练武。他挨次看去，密密层层\n"
              "的都是图形，心下不解，不知刻在这里有甚么用意。图形尽处，石壁上出\n"
              "现了几行字，也是以利器所刻，凑过去一看，见刻的是十六个字：“重宝\n"
              "秘术，付与有缘，入我门来，遇祸莫怨。”\n";
*/
        show = "这里是华山悬崖上的一个山洞，洞口有一根青藤摇晃着，洞内被修成\n"
              "一个简陋的石室，石室中空无一物，只是在石壁上刻有一些小字，凑过去\n"
              "一看，是十六个字：“重宝秘术  付与有缘  入我门来  遇祸莫怨”。\n";

        if (! arg || arg != "sword")
               return notify_fail("你要拔什么？\n");

        if (me->is_busy() || me->is_fighting())
               return notify_fail("等你忙完了再说吧！\n");

        if (! ob = find_object(SWORD))
                ob = load_object(SWORD);

        me->start_busy(2);

        if (environment(ob))
                return notify_fail("你要拔什么？\n");

        if (me->query_str() < 35)
               return notify_fail("你臂力不足，无法将剑拔起。\n");    

        message_vision(HIG "$N" HIG "用力将剑从地上拔出。\n" NOR, me);
        ob->move(me);

        set("long", show);
        return 1;          
}

int do_climb(string arg)
{
        object me = this_player();

        if (me->is_busy() || me->is_fighting())
               return notify_fail("等你忙完了再说吧！\n");

        message_vision(HIG "$N" HIG "拉着青藤爬上悬崖……\n", me);
                
        me->move("/d/huashan/chaoyang");

        me->start_busy(2);

        return 1;          
}