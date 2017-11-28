inherit ROOM;

void create()
{
        set("short", "草棚");
        set("long", @LONG
这里是小山脚下，孤令令的有一座草棚。这棚屋土墙草顶
形式宛如内地汉人的砖屋，只是甚为简陋。只见小屋之後系著
匹高头白马，健腿长鬣。你悄悄的掩向小屋後面，正想探头从
窗子向屋内张望，那知窗内有一张脸同时探了上来。
LONG);
        set("outdoors", "shenfeng");
        set("exits", ([
            	"north" : __DIR__"huijiang3",
        ]));
        set("objects", ([
                __DIR__"npc/ji"  : 1,
        ]) );
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
