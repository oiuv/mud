inherit ROOM;

void create()
{
        set("short", "文定北街");
        set("long", @LONG
这是中州城文定北街，宽敞的街道让人不竟心情一畅。街
道的东面有一间药铺。走到这里就可以闻见浓浓的药味。西面
人声鼎沸，原来是一座戏院子。
LONG);

	set("outdoors", "zhongzhou");
        set("exits", ([
                "east" : __DIR__"yaopu",
                "south" : __DIR__"wendingbei1",
                "west" : __DIR__"xiyuan",
                "north" : __DIR__"wendingbei3",
        ]));
        set("objects", ([
        	"/d/beijing/npc/shusheng1" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
