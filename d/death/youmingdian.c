// Copyright (C) 2003-2004, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

#include <ansi.h>
inherit ROOM;

void create ()
{
        set("short", HIB "幽冥殿" NOR   );
        set("long", HIB @LONG
这里便是名闻天下，令人提起心惊胆寒的阎幽冥殿。人死后都会在
这里受到应有的处置。正前一张大桌。正前坐着十殿阎罗。

LONG NOR);
        set("exits", ([ /* sizeof() == 1 */
                "south" : __DIR__"youmingjie",
                "north" : __DIR__"yanluodian",
        ]));
        
        set("hell", 1);
        set("no_fight", 1);
        
        set("objects", ([ /* sizeof() == 2 */
                __DIR__"npc/yanluo"        : 1,
                __DIR__"npc/yinchangsheng" : 1,
                __DIR__"npc/wangfangping"  : 1,                
        ]));
        setup();

}

int valid_leave(object me, string dir)
{
        //int i;
        //object ob;
        me = this_player();
        if (dir == "north")
        {
                if (! me->query("hell_quest/锁阳丹") && ! me->query("HellZhenPass"))
                        return notify_fail(CYN "十殿阎罗看了你一眼，喝道：你还不滚"
                                           "回去还阳，来这里凑什么热闹！\n" NOR);
        }
        return ::valid_leave(me, dir);
}

