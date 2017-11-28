inherit ROOM;

void create()
{
      set("short", "黑龙江栈道");
      set("long", @LONG
黑龙江栈道沿黑龙江而建。这里一山中开，两崖并立，形
成一道宽仅数尺，长达几百米的深峡——白云峡。黑龙江栈道
就从狭窄的白云峡中转折穿过，架设在绝壁上。走在栈道上只
觉道窄人危；俯视深涧，急流飞旋，山静而觉动；仰观头顶天
光如隙，崖开而欲合。这就是天开画图的「一线天」。栈道南
通千佛庵，北至清音阁。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "south" : __DIR__"heilong2",
          "north" : __DIR__"qingyinge",
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
