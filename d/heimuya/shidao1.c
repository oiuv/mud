inherit ROOM;

void create()
{
        set("short", "石道");
        set("long", @LONG
你一路往北行，中间仅有一道宽约五尺的石道，两边石壁
如墙，一路上都有日月教徒模样的人物在走动，对往来的路人
都严密监视。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"east" : __DIR__"guang",
            	"north" : __DIR__"shidao2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
