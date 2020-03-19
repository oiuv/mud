inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","居室");
        set("long",@LONG 
这是齐自勉的房间。齐自勉性格风雅，为人飘逸。墙上挂着
李白的《将进酒》，是齐自勉亲手所书，字迹豪放奔放，走的是
张旭狂草的路子，从这依稀也能看出主人武功的性情。照壁上一
幅《雪月夜行图》，是他当年一夜奔波八百里，灭掉太行三十寨
的荣事。桌上燃着一束檀香，散发出恬静的气息。一张焦尾琴摆
在桌上，主人正在自斟自饮，自得其乐。
LONG);
        set("exits", ([
            	"north"  : __DIR__"zoulang4", 
        ]));
        set("objects", ([  
                __DIR__"npc/qi" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

