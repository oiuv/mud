// Copyright (C) 2003-2004, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

#include <ansi.h>
inherit ROOM;

void recreate();

string *enter_msg = ({
        HIB+"\n你只觉得眼前一花，突然什么也听不见，什么也看不见......\n\n"+NOR,
        HIB+"只觉得身体不断的下坠......\n\n"+NOR,
        HIB+"坠向无尽的黑暗......\n\n"+NOR,
        HIB+"忽然仿佛一只大手托了你一下......\n\n"+NOR,
        HIB+"冥冥中隐约传来阵阵叮叮当当碰撞声......\n\n"+NOR,
        HIB+"你睁眼一看，发现自己已置身于一个喧嚣而似乎并不陌生的世界......\n\n"+NOR,
});

void entering_world(object me, int n);

void create()
{
        set("short", HIW "\n\n                无        间        道" NOR);
        set("long", HIW "\n"
"这里是天地人三界不管的终极无间，这里没有任何出路，只有黑暗。\n\n" NOR);

        setup();
}

void init()
{
        set("poem_said", 0);
        add_action("do_say", "say");
        add_action("do_enter", "enter");
        add_action("do_smash", "smash");
}

int do_say(string arg)
{
//      string dir;
        object ob;

        if( ! arg || arg == "" ) return 0;

        if( arg == "潜能无限，精意神通，身居祸福，自我主宰！" 
        &&  (int)query("poem_said") != 1 )
        {
                message_vision(HIW "\n只听$N" HIW "猛然高声喝道：“潜能无"
                               "限，精意神通，身居祸福，自我主宰！”\n" NOR + 
                               HIR "\n$N" HIR "话音刚"
                               "落，地面突然「轰隆隆」晃动了几下。眼前出"
                               "现了一个镜子。\n\n"
                               NOR, this_player());
                ob = new("/d/death/obj/wujian");
                ob->move(this_player(), 1); 
                message_vision(HIW "突然间电闪雷鸣，宇宙无敌之剑无间闪电伴随着道道闪电穿进$N的怀中！\n", this_player());     
                this_object()->recreate();
                set("poem_said", 1);
                return 1;
        }

        if( arg == "潜能无限，精意神通，身居祸福，自我主宰！" && (int)query("poem_said") == 1 )
        {
                write(HIC "\n你对着黑暗一声猛喝，声音在司内回荡了好一阵才消逝。\n" NOR);
                return 1;
        }
}

void recreate()
{
        set("short", HIW "\n\n                无        间        道" NOR);
        set("long", HIW "\n"
"这里是天地人三界不管的终极无间，这里没有任何出路，只有黑暗。\n"
"前方是一面足有一人高的大铜镜(mirror)。\n\n" NOR);

        set("item_desc", ([
                "大铜镜": "一面足有一人高的大铜镜，奇怪的是镜子里一片混沌，照不出任何人影。\n",
                "铜镜"  : "一面足有一人高的大铜镜，奇怪的是镜子里一片混沌，照不出任何人影。\n",
                "mirror": "一面足有一人高的大铜镜，奇怪的是镜子里一片混沌，照不出任何人影。\n",
        ]));
        set("objects", ([
                "/d/death/npc/ghost" : 21,
        ]));
        set("poem_said", 1);
        setup();
}


int do_enter(string arg)
{
        object me = this_player();
        
        if (! query("poem_said")) return 0;
       
       //新增防止转前临时转换门派 2017-02-21
                if (me->query_skill("force") < 800)
                	return notify_fail("你的武功修为太差，去练练再来吧！\n");
      //新增防止转前临时脱离转换门派结束
      
        if (objectp(present("ghost", environment(me)))) 
                return notify_fail("你还是先解决掉这些亡魂吧！\n");
              
        me->set_temp("entering_world", 1);
        message_vision("$N向着铜镜的方向走去。\n",me);
        call_out("entering_world", 1, me, 0);
        return 1;
}

void entering_world(object me, int n)
{
        object item; 

        remove_call_out("entering_world");

        tell_object(me, enter_msg[n]);

        if (n == sizeof(enter_msg) - 1)
        {
                me->delete_temp("entering_world");
                tell_room(environment(me), sprintf(HIY"铜镜中放出一道金光罩向%s，随后%s不见了。\n"NOR,
                          me->name(), me->name()), ({ me }));
                          
                me->clear_condition();
 
                foreach (item in all_inventory(me))
                {
                        message_vision("$N丢下了$n。\n", me, item);
                        if (item->is_character())
                                item->move(environment(me));
                        else
                                destruct(item);
                }

                // 选择特殊技能
                UPDATE_D->zhuan_player(me);

                me->move("/d/city/wumiao");
                me->set("startroom", "/d/city/wumiao");
                tell_room(environment(me),me->name()+"突然出现在眼前。\n",({me}));                                
                me->save();
                return;                
        }
        else
        {
                call_out("entering_world", 3, me, n + 1);
                return;
        }
}

int do_smash(string arg)
{
        object ob, weapon;
        object me = this_player();

        if (! objectp(weapon = me->query_temp("weapon")) || 
            weapon->query("id") != "wujian shandian")
                return notify_fail("你没有装备无间闪电，无法使用其 smash 神力！\n");

        if (! arg)
                return notify_fail("指令格式: smash <living>\n");
        
        ob = present(arg, environment(me));
        if (! ob )        
                return notify_fail("找不到这个生物。\n");

        message_vision(HIM "无间闪电化作无数闪电击向" + ob->query("name") + "...\n\n"
                       NOR, me);        
        if (! ob->is_character())
        {
                message_vision(HIM + ob->name() + HIM "从这个世界上消失了...\n\n"
                               NOR, me);
                destruct(ob);
                return 1;
        }
        
        ob->die();
        
        return 1;
}

