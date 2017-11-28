inherit ROOM;

void create()
{
      set("short", "正殿");
      set("long", @LONG
这里是峨嵋山金顶华藏庵的正殿。华藏庵规模宏大，殿内
青砖铺地，中间有普贤菩萨像，两旁列有万佛。正前方放一红
木供桌，陈列香烛，以供叩拜。自此左右各有一间侧殿，是接
待香客的地方。南面是通往一个大广场。
LONG);
      set("objects", ([
           CLASS_D("emei") + "/xin" : 1,
           __DIR__"npc/guest" : 1,
      ]));
      set("exits", ([
          "out"   : __DIR__"huacangan",
          "east"  : __DIR__"hcaeast", 
          "west"  : __DIR__"hcawest", 
          "south" : __DIR__"hcaguangchang", 
      ]));
      setup();
}

int valid_leave(object me, string dir)
{
        object ob;

        if (dir != "out" &&
            objectp(ob = present("jingxin shitai", this_object())))
                return ob->permit_pass(me, dir);
        return ::valid_leave(me, dir);
}
