inherit ROOM;

void create()
{
      set("short", "九十九道拐");
      set("long", @LONG
这是著名的「九十九道拐」，道路纡曲陡竖千折百回。据
说过去曾有个百余岁的疯僧至此，见一巨蟒挡路，便念咒驱蟒。
但人们得知此处有巨蟒出没后，便再也无人敢碰这里的草木并
以「龙居」名之。由此东可至千佛庵，西达九老洞。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "southwest" : __DIR__"jsjdg3",
          "eastdown"  : __DIR__"jsjdg1",
      ]));
      setup();
      replace_program(ROOM);
}
