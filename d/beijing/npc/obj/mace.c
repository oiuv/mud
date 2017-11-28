#include <weapon.h>

inherit CLUB;

void create()
{
  set_name("熟铜锏", ({"copper mace", "mace", "coppermace", "tongjian", "jian"}));
  set_weight(5000);
  if( clonep() )
    set_default_object(__FILE__);
  else {
    set("unit", "柄");
    set("value", 2000);
    set("material", "copper");
    set("long", "一柄沉甸甸的熟铜锏，上面铜锈斑斑。\n");
    set("wield_msg", "$N举起一柄$n，在地上撞出点点火星。\n");
    set("unwield_msg", "$N抹了抹$n上的锈，把它收了起来。\n");
  }
  
  init_club(25);
  setup();
}

