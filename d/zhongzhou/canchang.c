inherit ROOM;

void create()
{
        set("short", "菜场");
        set("long", @LONG
这是熙熙攘攘的菜场，地上湿湿的长年没有干的时候。商
人小贩们走来走去都想尽快卖完了回家。常年在这里摆摊的都
要给南面屋里的恶霸交保护费。
LONG);
	set("outdoors", "zhongzhou");

        set("exits", ([                 
                "south" : __DIR__"eba",
                "west" : __DIR__"wendingnan1",
        ]));
        set("objects", ([
                "d/beijing/npc/caifan" : 1,
                "d/city/npc/liumangtou" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
