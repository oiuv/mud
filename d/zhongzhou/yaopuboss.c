inherit ROOM;

void create()
{
	set("short", "药铺帐房");
	set("long", @LONG
这里就是药铺帐房，药铺的巫老板正坐在太师椅上抽大烟
呢。药铺的帐房先生巫攀冰在一旁忙着算帐。看着里面一大堆
的帐本，你想要是那收来的钱是我的可就好了。
LONG);
	set("objects", ([
  		__DIR__"npc/wupanbing" : 1,
	]));
        set("no_fight", 1);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"yaopu",
	]));

	setup();
	replace_program(ROOM);
}
