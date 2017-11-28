// regiser: yanluodian.c
// by Doing

#include <ansi.h>

inherit ROOM;


void create()
{
        set("short", HIR "阎罗殿" NOR);
        set("long", HIB @LONG
这里阴深恐怖，让人感觉到一阵阵的寒意，两旁列着牛头马面，冥
府狱卒，各个威严肃穆。十殿阎罗，尽皆在此，地藏王正坐在大堂之上，
不怒自威，你的腿脚不禁都有些软了。
    大殿角落有一个石头砌成的池子，其中水清澈却不见底，不知道它
究竟有多深。
LONG NOR
);
        set("no_fight", 1);
        // set("no_magic", 1);
        
        set("exits", ([
                "east"  : __DIR__"jimiesi",        
                "south" : __DIR__"youmingdian",
                "west"  : __DIR__"yinyangta1",
                "north" : __DIR__"xuechi1",
        ]));
        
        set("objects", ([
                __DIR__"npc/dizangwang"    : 1,
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
       // int i;
      //  object ob;
        me = this_player();
        if (dir != "south")
        {
                if (objectp(present("dizang", environment(me))) 
                &&  ! me->query("hell_quest/锁阳丹")
                &&  ! me->query("DiZangPass"))
                        return notify_fail(CYN "地藏王看了你一眼，喝道：你还不滚"
                                           "回去还阳，来这里凑什么热闹！\n" NOR);
        }
        return ::valid_leave(me, dir);
}
       
