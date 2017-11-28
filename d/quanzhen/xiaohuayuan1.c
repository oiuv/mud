inherit ROOM;

void create()
{
        set("short", "小花园");
        set("long", @LONG
这里是重阳观里的小花园，空气中飘着股鲜花的香味。再
往北去，就是金鱼池了。这个花园不大，却是全真弟子练功间
隙最爱来游玩的地方。园中见不到一根杂草，也许专门有人负
责管理这里。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "southwest" : __DIR__"houtang3",
                "northeast" : __DIR__"xiaohuayuan2",
        ]));

        set("objects", ([
                __DIR__"npc/zhangyuan" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
