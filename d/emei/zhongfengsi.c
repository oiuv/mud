inherit ROOM;

void create()
{
      set("short", "中峰寺");
      set("long", @LONG
中峰寺在白云峰下，始建于晋代，原为道观。传说观内的
道人每年在三月三日都献身给山中一条大蟒，以为可升仙。后
来有个从资州来的明果禅师，杀了那条大蟒，道士们始知上当，
感激不已，自愿改信佛教，从此改观为寺。这里往北可到清音
阁，东下至神水庵。
LONG);
      set("objects", ([
               __DIR__+"npc/guest": 1,
      ]));
      set("exits", ([
          "west"     : __DIR__"qingyinge",
          "eastdown" : __DIR__"shenshuian",
      ]));
      set("outdoors", "emei");
      setup();
      replace_program(ROOM);
}
