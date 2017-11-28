inherit ROOM;

void create()
{
        set("short", "刑场");
        set("long", @LONG
这里是京城的刑场，是朝廷处决钦犯的场所。你走到了这里，发现整个刑
场很是空旷，刑场正中有一个高高的石台，石台上由几根圆木柱搭建成了一个
框架，上面垂着一根很粗的麻绳。框架下面是一个正方形的大木桩，上面还能
够看见隐隐血迹。
LONG );
       set("exits", ([
                "west" : __DIR__"wang_2",
        ]));
        set("objects", ([
                __DIR__"npc/guizishou" : 1,
                "/clone/npc/walker" : 1,
        ]));

        setup();
       set("outdoors", "beijing");
        replace_program(ROOM);
}
