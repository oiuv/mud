inherit ROOM;

void create()
{
      set("short", "凌云梯");
      set("long", @LONG
这是凌云梯，最早是一位叫阿婆多的外国和尚在此缚木架
石，以渡行人，又叫「胡僧梯」。路边有梅子坡，可见满坡青
梅如豆，于疏枝密叶中逗引行人，甚有望梅止渴之功用。此梯
北通洗象池，南至雷洞坪。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "northdown" : __DIR__"xixiangchi",
          "southup"   : __DIR__"leidongping",
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
