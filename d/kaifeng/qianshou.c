inherit ROOM;

void create()
{
        set("short", "千手千眼佛殿");
        set("long", @LONG
这座佛殿中供奉的是千手千眼观音，据说观音菩萨普渡众
生，化身万千。你仔细看去，只见佛像伸出长长短短的手臂每
个手掌中心都有只眼睛。意思是警告你“我眼睛多，什么都能
够注意到，我手多，什么都能管到，可别作坏事。”
LONG
        );
        set("exits", ([
  		"west" : __DIR__"fangsheng",
  		"east" : __DIR__"houyuan",
	]));
        set("no_clean_up", 0);
        set("objects", ([
  		__DIR__"npc/oldwomen" : 1,
  		__DIR__"npc/obj/guanyin" : 1,
	]));

        setup();
        replace_program(ROOM);
}
