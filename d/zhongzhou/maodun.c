inherit ROOM;

void create()
{
        set("short", "甲胄店");
        set("long", @LONG
这是间小小的店铺，铺中的主人据说有一手修补甲胄的绝
艺，只要你需要，可以随时给钱修补。一些还没修理过的铁甲
铜盔之类的东西胡乱扔在地上，看上去很杂乱。
LONG);
        set("objects", ([
  		__DIR__"npc/smith" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"wendingnan2",
	]));

        setup();
        replace_program(ROOM);
}
