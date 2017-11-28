// Copyright (C) 2003-2004, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

#include <ansi.h>
inherit ROOM; 

int num_of_killer;
string call_killer();

void create() 
{ 
        set("short", HIB "幽冥界" NOR);
        set("long", HIB @LONG
幽冥界，你疑心怎么从酆都走到这里来了的。四处弥漫着浓厚的烟
雾，你什么也看不清楚，空中浮动着若隐若现的鬼火，周围似乎有一双
双眼睛盯着你看，你走了几步，看见地上斜插着一块石碑(shibei)，你
连忙俯身下去看上面的字。

LONG NOR);
        set("no_clean_up", 0);
        set("item_desc", ([
                "shibei" : (: call_killer :),
        ]));

        set("objects", ([
        ]));
        
        set("exits", ([ /* sizeof() == 2 */
                "north" : __DIR__"youmingdian",
                "south" : "/d/death/qiao2",
        ]));
       
        setup();
        reset();
}

void reset()
{
        ::reset();
        num_of_killer = 5;
}

string call_killer()
{
        object ob;
        if (num_of_killer == 0) 
        return "石碑上写着几个血红的大字：
"HIR"        酆 都 鬼 域 幽 冥 地 府 ！！"NOR"
忽然你觉得背后似乎有脚步声，于是猛然回头一看。。。
什么也没发现，原来是虚惊一场。\n";
        num_of_killer --;
        if (num_of_killer == 1)
        ob = new(__DIR__"npc/qinguangwang");
        else
        ob = new(__DIR__"npc/ghost");
        ob->move("/d/death/youmingjie");
        return "石碑上写着几个血红的大字：
"HIR"        酆 都 鬼 域 幽 冥 地 府 ！！"NOR"
忽然你觉得背后似乎有脚步声，于是猛然回头一看。。。\n";
}


