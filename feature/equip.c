//	equip.c

#include <dbase.h>
#include <weapon.h>

int wear()
{
	object owner;
	mapping armor_prop, applied_prop;
	string *apply, type;

	// Only character object can wear armors.
	owner = environment();
	if (! owner || ! owner->is_character()) return 0;

        // Does the consistence valid ?
        if (query("consistence") < 1)
                return notify_fail(this_object()->name() + "现在损坏太严重了，不能继续穿戴了。\n");

	// If already worn, just recognize it.
	if (query("equipped")) return 1;

        // If handing it now, stop handing
        if (owner->query_temp("handing") == this_object())
                owner->delete_temp("handing");

	// Check if we have "armor_prop" defined.
	if (! mapp(armor_prop = query("armor_prop")) ||
            ! stringp(type = query("armor_type")))
		return notify_fail("你只能穿戴可当作护具的东西。\n");

	if (owner->query_temp("armor/" + type))
		return notify_fail("你已经穿戴了同类型的护具了。\n");

	owner->set_temp("armor/" + type, this_object());
	apply = keys(armor_prop);
	applied_prop = owner->query_temp("apply");
	if (! mapp(applied_prop)) applied_prop = ([]);
	for(int i = 0; i<sizeof(apply); i++)
		if (undefinedp(applied_prop[apply[i]]))
			applied_prop[apply[i]] = armor_prop[apply[i]];
		else
			applied_prop[apply[i]] += armor_prop[apply[i]];
	owner->set_temp("apply", applied_prop);
	set("equipped", "worn");
	return 1;
}

int wield()
{
	object owner, old_weapon;
	mapping weapon_prop;
	string *apply/*, type*/;
        mixed no_wield;
	int flag;

	// Only character object can wear armors.
	owner = environment();
	if (! owner || ! owner->is_character()) return 0;

        // Does the consistence valid ?
        if (query("consistence") < 1)
                return notify_fail(this_object()->name() + "现在损坏太严重了，不能继续装备了。\n");

	// If already wielded, just recognize it.
	if (query("equipped")) return 1;

        // If the item can not wield, I will return the fail message
        if (no_wield = query("no_wield"))
        {
                // can not wield
                if (stringp(no_wield))
                        return notify_fail(no_wield);
                else
                        return notify_fail("这样东西无法装备。");
        }

        // If handing it now, stop handing
        if (owner->query_temp("handing") == this_object())
                owner->delete_temp("handing");

	// Check if we have "weapon_prop" defined.
	if (! mapp(weapon_prop = query("weapon_prop")) ||
            ! stringp(query("skill_type")))
		return notify_fail("你只能装备可当作武器的东西。\n");

	flag = query("flag");

	if (flag & TWO_HANDED)
	{
		if(owner->query_temp("secondary_weapon") ||
		   owner->query_temp("weapon") ||
                   owner->query_temp("handing"))
			return notify_fail("你必须空出双手才能装备该武器。\n");
		owner->set_temp("weapon", this_object());
	} else
	{
		// If we are are using any weapon?
		if (! (old_weapon = owner->query_temp("weapon")))
			owner->set_temp("weapon", this_object());

		else // If we still have a free hand? 
		if (!owner->query_temp("secondary_weapon")
                &&  !owner->query_temp("handing"))
		{
			// If we can wield this as secondary weapon?
	              	if(flag & SECONDARY) {
				owner->set_temp("secondary_weapon", this_object());
                        }            
			// If we can switch our old weapon to secondary weapon ?
			else if( (int)old_weapon->query("flag") & SECONDARY ) {
				old_weapon->unequip();
				owner->set_temp("weapon", this_object());
				old_weapon->wield();

			// We need unwield our old weapon before we can use this one.
			} else 
				return notify_fail("你必须先放下你目前装备的武器。\n");

		// We have both hands wearing something.
		} else
			return notify_fail("你必须空出一只手来使用武器。\n");
	}

        // add by doing to discard the secondary_weapon's prop
        if (owner->query_temp("secondary_weapon") != this_object())
        {
	        apply = keys(weapon_prop);
	        for(int i = 0; i<sizeof(apply); i++)
		        owner->add_temp("apply/" + apply[i], weapon_prop[apply[i]]);
        }

	owner->reset_action();
	set("equipped", "wielded");
	return 1;
}

int unequip()
{
	object owner;
	mapping prop = 0, applied_prop;
	string *apply, equipped;

	if (! (owner = environment())->is_character())
		return 0;

	if (! stringp(equipped = query("equipped")))
		return notify_fail("你目前并没有装备这样东西。\n");

	if (equipped == "wielded")
	{
		if ((object)owner->query_temp("weapon") == this_object())
                {
		        prop = query("weapon_prop");
			owner->delete_temp("weapon");
		} else
		if ((object)owner->query_temp("secondary_weapon") == this_object())
                {
			owner->delete_temp("secondary_weapon");
                        prop = 0;
                }
		owner->reset_action();
	} else
	if (equipped == "worn")
	{
		owner->delete_temp("armor/" + query("armor_type"));
		prop = query("armor_prop");
	}

        if (mapp(prop))
        {
        	apply = keys(prop);
        	applied_prop = owner->query_temp("apply");
        	for (int i = 0; i<sizeof(apply); i++)
        		// To support array apply, we cannot add_temp() here.
        		applied_prop[apply[i]] -= prop[apply[i]];
        }

	delete("equipped");
	return 1;
}

// hit the object as a weapon
mixed hit_ob(object me, object victim, int damage_bonus)
{
        mixed foo;

        foo = this_object()->weapon_hit_ob(me, victim, damage_bonus);

        ITEM_D->reduce_consistence(this_object());

        if (! mapp(query_temp("daub")))
                return foo;

        COMBAT_D->hit_with_poison(me, victim, this_object());
        return foo;
}

// other one hit me as an armor
mixed valid_damage(object me, object victim, int damage_bonus)
{
        ITEM_D->reduce_consistence(this_object());

        if (! mapp(query_temp("daub")))
                return;

        if (me->query_temp("weapon") || me->query_temp("remote_attack") ||
	    me->query("not_living"))
	{
                // the attacker has weapon, or remote attack, or not living,
		// he won't be poisoned by my cloth or armor
                return;
	}

        COMBAT_D->hit_poison(me, victim, this_object());
        return;
}