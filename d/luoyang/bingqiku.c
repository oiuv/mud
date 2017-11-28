inherit ROOM;

void create()
{
	set("short", "兵器库");
	set("long", @LONG
这里是兵器库，到处银光闪闪，让人眼花缭乱。宝刀、宝剑、金箍棒，
大刀、长剑、哨棒，短刀、短剑、短棍，各色各样的兵器应有尽有，你一
时不知道挑什么好。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"bingyin",
	]));
        set("objects", ([
                "/clone/weapon/changjian" : 2,
                "/clone/weapon/gangdao" : 2,
                "/clone/weapon/dagger" : 2,
        ]));

	setup();
	replace_program(ROOM);
}
