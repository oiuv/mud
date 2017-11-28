inherit ROOM;

void create()
{
  	set("short", "东厢房");
  	set("long", @LONG
这里是日月神教成德殿的后厅东侧的厢房，房内摆有一张
熏香大床，上面铺着雕龙锦被。在这里睡觉非常舒服，没人能
打扰。南面是气派的长廊。
LONG );
  	set("exits",([
      		"west" : __DIR__"huoting",
  	]));
  	set("sleep_room", 1);
  	set("no_fight",1);
  	set("no_steal",1);
  	set("no_clean_up", 0);
  	setup();
  	replace_program(ROOM);
}

