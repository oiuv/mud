/** unique.c

    Copyright (C) 1994-2000 Annihilator <annihilator@muds.net>

    This program is a part of ES2 mudlib. Permission is granted to use,
    modify, copy or distribute this program provided this copyright notice
    remains intact and subject to the restriction that this program MAY
    NOT be used in any way for monetary gain.

    Details of terms and conditions is available in the Copyright.ES2 file.
    If you don't receive this file along with this program, write to the
    primary author of ES2 mudlib: Annihilator <annihilator@muds.net>
*/

// This function returns 1 if this_object() is not the unique clone in
// the mud. Note that calling this function on master copy always return
// 0.
nomask int violate_unique()
{
    object *ob;

    if (!clonep(this_object()))
        return 0;

    // Find all the cloned instance of this_object()
    ob = filter_array(children(base_name(this_object())), (: clonep :));

    return sizeof(ob) > 1;
}

// This function returns the replica of this_object() if any.
object create_replica()
{
    string replica;
    object obj;

    seteuid(getuid());
    if (stringp(replica = this_object()->query("replica_ob")))
        obj = new (replica);
    else
        obj = 0;
    destruct(this_object());
    return obj;
}
