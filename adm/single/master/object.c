
// compile_object: This is used for loading MudOS "virtual" objects.
// It should return the object the mudlib wishes to associate with the
// filename named by 'file'.  It should return 0 if no object is to be
// associated.
mixed compile_object(string file)
{
    object daemon;

    if (daemon = find_object(VIRTUAL_D))
        return daemon->compile_object(file);
    else
        return 0;
}

string object_name(object ob)
{
    if (ob) return ob->short();
}
