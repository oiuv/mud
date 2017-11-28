//Room: beian-dadao.c

inherit ROOM;

void create ()
{
        set ("short", "北安大道");
        set ("long", @LONG
长安城的主街北安大道宽敞笔直，繁华热闹，许多外来的旅客和商
人都不断来往经过这里。北安大道再向北就是长安城的北城门，往南则
是故皇宫的白虎街。
LONG);
        set("exits", 
        ([ //sizeof() == 2
		"north" : __DIR__"beian-daokou",
        	"south" : __DIR__"baihu2",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
