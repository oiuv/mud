inherit ROOM;

void create()
{
        set("short", "莫高窟");
        set("long", @LONG
这里墙壁上绘制着与佛教相关的画面，有仙女飞天，还有
反弹琵琶。洞中还有很多佛像和经书。你被这些瑰丽的文化之
宝惊呆了。
LONG );
        set("exits", ([ 
             	"out" : __DIR__"yueerquan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

