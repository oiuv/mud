inherit ROOM;

void create()
{
      set("short", "灵文阁");
      set("long", @LONG
这里是福寿庵的灵文阁，是主持静照师太传授佛法的地方。
两名青衣小尼姑随侍在旁，似乎在聆听师太的教晦。阁内布置简
陋，靠墙放着几把竹椅，地上放着几个蒲团。东首有一禅房。西
面是一个斋厅。
LONG);
      set("objects", ([
           CLASS_D("emei") + "/zhao" : 1,
      ]));
      set("exits", ([
          "out"  : __DIR__"fushouan",
          "east" : __DIR__"fsachanfang",
          "west" : __DIR__"fsazhaitang",
      ]));
      setup();
      replace_program(ROOM);
}
