// dagger.c : an example weapon

#include <weapon.h>

inherit DAGGER;

void create()
{
   set_name("匕首", ({"bi shou", "bishou", "dagger" }) );
   set_weight(1000);
   if( clonep() )
     set_default_object(__FILE__);
   else {
     set("unit", "把");
     set("long", "这是一把看起相当普通的匕首。\n");
     set("value", 50);
     set("material", "steel");
   }
   init_dagger(4);

   set("wield_msg", "$N从怀中摸出一把$n握在手中。\n");
   set("unwield_msg", "$N将手中的$n藏入怀中。\n");

   setup();
}
