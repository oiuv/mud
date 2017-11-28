//Room: xiaojia-qianyuan.c

inherit ROOM;
void create ()
{
        set ("short", "萧家前院");
        set ("long", @LONG
来到这里，一座富丽堂皇的巨宅院出现在你的眼前，大门两侧是两
头高大的石狮子。门上挂着两个灯笼，赫然写着大大的“萧”字。
LONG);
        set("exits", ([
        	"west" : __DIR__"liande-dadao5",
        	"east" : __DIR__"xiaojiadt",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/guanjia" : 1,
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
