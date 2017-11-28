inherit ROOM;

void create()
{
      set("short", "华藏庵后殿");
      set("long", @LONG
这是峨嵋山华藏庵的后殿。是峨嵋派掌门人传教弟子功夫
的地方。这里供有一尊普贤菩萨像。两旁靠墙放着几张太师椅
地上放着几个蒲团。掌门人正在向几个女弟子传授武功。
LONG);
      set("objects", ([
           CLASS_D("emei") + "/miejue" : 1,
      ]));
      set("no_get_from", 1);
      set("no_get", 1);
      set("no_steal", 1);
      set("no_clean_up", 0);
      set("exits", ([
          "north"   : __DIR__"hcadadian", 
      ]));
      setup();
      replace_program(ROOM);
}
