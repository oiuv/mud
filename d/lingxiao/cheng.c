inherit ROOM;

void create()
{
        set("short", "居室");
        set("long", @LONG 
这是成自学的房间。成自学虽和四位师弟一样，由白自在代
师授艺，但在四位师兄弟中，他和白自在关系最好。同时他为人
方正，刚严不曲，最得白自在信任，所以白自在在失踪以前，把
凌霄城的寒玉牌交给他保管。这间屋子整洁典雅，只在桌上放着
一卷未写完的帛卷。
LONG);
        set("exits", ([
            	"south"  : __DIR__"zoulang4", 
        ]));
        set("objects", ([  
                __DIR__"npc/cheng" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

