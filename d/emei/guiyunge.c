inherit ROOM;

void create()
{
      set("short", "归云阁");
      set("long", @LONG
归云阁，原是唐代福昌达道禅师的道场。宋代绍兴年间僧
人士性又率众重建。归云阁左有玉女峰，西上可抵纯阳殿，东
下是观音堂。
LONG);
      set("objects", ([
           __DIR__"npc/boydizi" : 1,
           __DIR__"npc/girldizi" : 1,
      ]));
      set("exits", ([
          "eastdown"  : __DIR__"guanyintang",
          "westup"    : __DIR__"chunyangdian",
          "southup"   : __DIR__"yunufeng",
      ]));
      set("outdoors", "emei");
      setup();
      replace_program(ROOM);
}
