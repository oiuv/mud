inherit ROOM;

void create()
{
        set("short", "黄员外府邸");
        set("long", @LONG
这里是中州富豪黄员外府邸的前院，一面大大的墙门上画
了个大的倒的富字。绕过墙门可以到黄员外的前厅。不过据说
黄员外是中州出了名的恶霸。没什么事的话还是不要进去为妙。
LONG);
        set("objects",([
                "/clone/quarry/gou2" : 2,
                __DIR__"npc/guanjia" : 1,
                __DIR__"npc/jiading" : 2,
        ]));
        set("exits", ([
  		"south" : __DIR__"yanlingdong1",
	]));
        set("outdoors", "zhongzhou");

        setup();
        replace_program(ROOM);
}
