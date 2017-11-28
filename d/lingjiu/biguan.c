inherit ROOM;
void create()
{
  	set("short", "闭关室");
  	set("long", @LONG
这里当年本是天山童姥闭关修练的地方，至天山童姥仙去
之后，虚竹子便将此处挪出，让梅兰竹菊四姐妹居住。
LONG );
  	set("sleep_room", 1);
  	set("exits",([
      		"south" : __DIR__"men3",
  	]));
        set("objects",([
                CLASS_D("lingjiu") + "/jujian" : 1,
        ]));

  	setup();
  	replace_program(ROOM);
}
