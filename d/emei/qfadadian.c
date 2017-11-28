inherit ROOM;

void create()
{
      set("short", "大殿");
      set("long", @LONG
千佛庵内殿宇高广宏阔，清洁庄严。庵内有一具七万千佛
莲灯，有纹龙七条环于灯体，并有佛像数百周匝排列，雕缕精
致无比。
LONG);
      set("objects", ([
           CLASS_D("emei") + "/hui" : 1,
           CLASS_D("emei") + "/wenyin" : 1,
      ]));
      set("exits", ([
          "out"  : __DIR__"qianfoan",
          "east" : __DIR__"qfachanfang",
      ]));
      setup();
      replace_program(ROOM);
}
