inherit ROOM;

void create()
{
	set("short", "客厅");
        set("long", @long
这里是客厅，里面简单，只有一些椅子和桌子，桌子上摆
着写茶和点心供客人食用。不少的江湖人士不远千里来到这里
往往先到这里歇息片刻，恢复一下。
long);
        set("exits",([
		"west" : __DIR__"elang01",
	]));

	set("outdoors", "kunlun");
	setup();
	replace_program(ROOM);
}
