inherit ROOM;

void create()
{
      set("short", "解脱坡");
      set("long", @LONG
这里是峨嵋胜地解脱坡。坡下一座小桥，叫解脱桥。行人
至此，坐桥上听泉声甚美。当此良辰美景，心无芥蒂，心即解
脱。坡上一座庵堂，东下一片密林。桥下山溪向东流淌到报国
寺的西面。
LONG);
      set("exits", ([
          "eastdown" : __DIR__"milin2",
          "westup"   : __DIR__"guanyintang",
      ]));
      set("outdoors", "emei");
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
